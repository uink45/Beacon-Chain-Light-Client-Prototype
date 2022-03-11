using System;
using System.Collections;
using System.Numerics;
using System.Linq;
using Nethermind.Core2.Types;
using Nethermind.Core2.Containers;
using Nethermind.Core2.Crypto;
using Nethermind.HashLib;


namespace Lantern
{
    public class LightClientUtility 
    {
        private readonly static BigInteger s_curveOrder = BigInteger.Parse("52435875175126190479447740508185965837690552500527637822603658699938581184513");
        public enum Networks
        {
            Beacon,
            Prater
        }

        public Constants Constant;
        public Constants.TimeParameters TimeParameterOptions;
        public BLSUtility Crypto;
        
        public LightClientUtility()
        {
            TimeParameterOptions = new Constants.TimeParameters();
            Crypto = new BLSUtility();
            Constant = new Constants();
        }

        /// <summary>
        /// Return the epoch number of ``slot``.
        /// </summary>
        public Epoch ComputeEpochAtSlot(Slot slot)
        {
            return new Epoch(slot / TimeParameterOptions.SlotsPerEpoch);
        }

        /// <summary>
        /// Return the signature domain of the 
        /// domain type, fork version, and 
        /// genesis validator's root.
        /// </summary>
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

        /// <summary>
        /// Return the signing root of an object by 
        /// calculating the root of the object-domain tree.
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
                var indexAtDepth = Math.Floor(index / Math.Pow(2, testDepth));

                if (indexAtDepth % 2 == 0)
                {
                    // Branch on right
                    value = Crypto.Hash(value, branch[testDepth]);
                }
                else
                {
                    // Branch on left
                    value = Crypto.Hash(branch[testDepth], value);
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


        public dynamic ToObject(string hex, string type)
        {
            switch (type) 
            {
                case "BlsSignature":
                    return new BlsSignature(ToBytes(hex));
                case "BlsPublicKey":
                    return new BlsPublicKey(ToBytes(hex));
                case "Hash32":
                    return new Hash32(ToBytes(hex));
                case "Root":
                    return new Root(ToBytes(hex));
                case "ForkVersion":
                    return new ForkVersion(ToBytes(hex));
                case "BitArray":
                    return new BitArray(ToBits(hex));
                case "DomainType":
                    return new DomainType(ToBytes(hex));
            }
            return null;            
        }

        public byte[] ToBytes(string hex)
        {
            hex = hex.Remove(0, 2);
            return Enumerable.Range(0, hex.Length)
                     .Where(x => x % 2 == 0)
                     .Select(x => Convert.ToByte(hex.Substring(x, 2), 16))
                     .ToArray();
        }

        public byte[] ToBits(string hex)
        {
            hex = hex.Remove(0, 2);
            int NumberChars = hex.Length;
            byte[] bytes = new byte[NumberChars / 2];
            for (int i = 0; i < NumberChars; i += 2)
                bytes[i / 2] = Convert.ToByte(hex.Substring(i, 2), 16);
            return bytes;
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
