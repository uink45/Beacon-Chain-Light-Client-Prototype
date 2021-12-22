using System;
using System.Collections;
using System.Numerics;
using System.Collections.Generic;
using System.Linq;
using Nethermind.Core2.Types;
using Nethermind.Core2.Containers;
using Nethermind.Core2.Crypto;
using Nethermind.HashLib;


namespace LightClientV2
{
    public class LightClientUtility 
    {
        private readonly static BigInteger s_curveOrder = BigInteger.Parse("52435875175126190479447740508185965837690552500527637822603658699938581184513");
        public Constants Constant;
        public TimeParameters TimeParameterOptions { get; }
        public CryptoUtility Crypto { get; }
        
        public LightClientUtility()
        {
            TimeParameterOptions = new TimeParameters();
            Crypto = new CryptoUtility();
            Constant = new Constants();
        }

        /// <summary>
        /// Return the epoch number of ``slot``.
        /// </summary>
        public Epoch ComputeEpochAtSlot(Slot slot)
        {
            return new Epoch(slot / TimeParameterOptions.SlotsPerEpoch);
        }

        public Domain ComputeDomain(DomainType domainType, ForkVersion forkVersion, Root genesisValidatorsRoot)
        {
            Root forkDataRoot = new ForkData(forkVersion, genesisValidatorsRoot).HashTreeRoot();
            byte[] array2 = domainType.AsSpan().Slice(0, 4).ToArray();            
            byte[] array3 = forkDataRoot.AsSpan().Slice(0, 28).ToArray();
            int number = 0;
            for(int i = 0; i < array3.Length; i++)
            {
                number++;
            }
            byte[] array = array2.Concat(array3).ToArray();
            return new Domain(array);
        }

        public byte[] StringToByteArray(string hex)
        {
            hex = hex.Remove(0, 2);
            return Enumerable.Range(0, hex.Length)
                             .Where(x => x % 2 == 0)
                             .Select(x => Convert.ToByte(hex.Substring(x, 2), 16))
                             .ToArray();
        }


        /// <summary>
        /// Return the signing root of an object by calculating the root of the object-domain tree.
        /// </summary>
        public Root ComputeSigningRoot(Root blockRoot, Domain domain)
        {
            SigningRoot domainWrappedObject = new SigningRoot(blockRoot, domain);
            return domainWrappedObject.HashTreeRoot();
        }

        public bool isEmptyHeader(BeaconBlockHeader header)
        {
            return header == new BeaconBlockHeader(null) ? true : false;
        }

        public void assertZeroHashes(Root[] rootArray, int expectedLength, string errorMessage)
        {
            if(rootArray.Length != expectedLength)
            {
                throw new Exception($"Wrong length {errorMessage}");
            }
            foreach(Root root in rootArray)
            {
                if (!isZeroHash(root))
                {
                    throw new Exception($"Not zeroed {errorMessage}");
                }
            }
        }

        public bool isZeroHash(Root root)
        {
            
            for (int i = 0; i < root.ToString().Length; i++)
            {
                if (root.ToString()[i] != '0' & root.ToString()[i] != 'x') 
                {
                    return false;
                }
            }
            return true;
        }

        public bool IsValidMerkleBranch(Root leaf, Root[] branch, int depth, ulong index, Root root)
        {
            var value = leaf;
            for (var testDepth = 0; testDepth < depth; testDepth++)
            {
                var branchValue = branch[testDepth];
                var indexAtDepth = index / ((ulong)1 << testDepth);
                if (indexAtDepth % 2 == 0)
                {
                    // Branch on right
                    value = Crypto.Hash(value, branchValue);
                }
                else
                {
                    // Branch on left
                    value = Crypto.Hash(branchValue, value);
                }
            }
            return value.Equals(root);
        }

        public BlsPublicKey[] GetParticipantPubkeys(BlsPublicKey[] publicKeys, BitArray syncCommitteeBits)
        {
            BlsPublicKey[] _publicKeys = new BlsPublicKey[syncCommitteeBits.Cast<bool>().Count(l => l)];
            int index = 0;
            for (int i = 0; i < syncCommitteeBits.Count; i++)
            {
                if (syncCommitteeBits[i])
                {
                    _publicKeys[index] = BlsPublicKey.Zero;
                    _publicKeys[index] = publicKeys[i];
                    index++;
                }
                
            }
          
            return _publicKeys;
        }

        public byte[] GeneratePrivateKey(ulong index)
        {
            var input = new Span<byte>(new byte[32]);
            var bigIndex = new BigInteger(index);
            var success = bigIndex.TryWriteBytes(input, out var bytesWritten);
            if (!success || bytesWritten == 0)
            {
                throw new Exception("Error getting input for quick start private key generation.");
            }

            var hash = Crypto.Hash(input).AsSpan();

            var value = new BigInteger(hash.ToArray());
            var privateKey = value % s_curveOrder;

            var privateKeySpan = new Span<byte>(new byte[32]);
            var success2 = privateKey.TryWriteBytes(privateKeySpan, out var bytesWritten2);
            if (!success2 || bytesWritten2 != 32)
            {
                throw new Exception("Error generating quick start private key.");
            }

            return privateKeySpan.ToArray();
        }

        public BlsSignature ConvertStringToBlsSignature(string hex)
        {
            hex = hex.Remove(0, 2);
            return new BlsSignature(Enumerable.Range(0, hex.Length)
                     .Where(x => x % 2 == 0)
                     .Select(x => Convert.ToByte(hex.Substring(x, 2), 16))
                     .ToArray());
        }

        public BlsPublicKey ConvertStringToBlsPubKey(string hex)
        {
            hex = hex.Remove(0,2);
            return new BlsPublicKey(Enumerable.Range(0, hex.Length)
                             .Where(x => x % 2 == 0)
                             .Select(x => Convert.ToByte(hex.Substring(x, 2), 16))
                             .ToArray());
        }

        public BlsPublicKey[] ConvertListToBlsPubKeys(List<Datum> list, int length)
        {
            BlsPublicKey[] blsPublicKeys = InitializeArray<BlsPublicKey>(length-1);
            for(int i = 0; i < list.Count; i++)
            {
                blsPublicKeys[i] = ConvertStringToBlsPubKey(list[i].validator.pubkey);
            }
            return blsPublicKeys;
        }

        public Hash32 ConvertHexStringToHash(string hex)
        {
            hex = hex.Remove(0, 2);
            Hash32 hash = new Hash32( Enumerable.Range(0, hex.Length)
                             .Where(x => x % 2 == 0)
                             .Select(x => Convert.ToByte(hex.Substring(x, 2), 16))
                             .ToArray());
            return hash;
        }

        public Bytes32 ConvertHexStringToBytes(string hex)
        {
            hex = hex.Remove(0, 2);
            Bytes32 bytes32 = new Bytes32(Enumerable.Range(0, hex.Length)
                             .Where(x => x % 2 == 0)
                             .Select(x => Convert.ToByte(hex.Substring(x, 2), 16))
                             .ToArray());
            return bytes32;
        }

        public Root ConvertHexStringToRoot(string hex)
        {
            hex = hex.Remove(0, 2);
            Root hash = new Root(Enumerable.Range(0, hex.Length)
                             .Where(x => x % 2 == 0)
                             .Select(x => Convert.ToByte(hex.Substring(x, 2), 16))
                             .ToArray());
            return hash;
        }

        public ForkVersion ConvertStringToForkVersion(string hex)
        {
            hex = hex.Remove(0, 2);
            return new ForkVersion(Enumerable.Range(0, hex.Length)
                             .Where(x => x % 2 == 0)
                             .Select(x => Convert.ToByte(hex.Substring(x, 2), 16))
                             .ToArray());
        }

        public BitArray StringToBitArray(string hex)
        {
            hex = hex.Remove(0, 2);
            int NumberChars = hex.Length;
            byte[] bytes = new byte[NumberChars / 2];
            for (int i = 0; i < NumberChars; i += 2)
                bytes[i / 2] = Convert.ToByte(hex.Substring(i, 2), 16);
            return new BitArray(bytes);
        }

        public T[] InitializeArray<T>(int length) where T : new()
        {
            T[] array = new T[length + 1];
            for (int i = 0; i < length + 1; ++i)
            {
                array[i] = new T();
            }

            return array;
        }
    }
}
