using System;
using System.Collections.Generic;
using System.Linq;
using Nethermind.Core2.Crypto;
using System.Security.Cryptography;
using Nethermind.Core2.Types;
using Nethermind.Cryptography;

namespace LightClientV2
{
    public class CryptoUtility
    {
        private readonly BLS _bls;
        private static readonly HashAlgorithm s_hashAlgorithm = SHA256.Create();
        public Func<BLSParameters, BLS> SignatureAlgorithmFactory { get; set; } = blsParameters => BLS.Create(blsParameters);

        public CryptoUtility() {
            BLSParameters blsParameters = new BLSParameters();
            _bls = BLS.Create(blsParameters);
        }

        public BlsPublicKey BlsAggregatePublicKeys(IList<BlsPublicKey> publicKeys)
        {
            Span<byte> publicKeysSpan = new Span<byte>(new byte[publicKeys.Count() * BlsPublicKey.Length]);
            int publicKeysSpanIndex = 0;
            foreach (BlsPublicKey publicKey in publicKeys)
            {
                publicKey.AsSpan().CopyTo(publicKeysSpan.Slice(publicKeysSpanIndex));
                publicKeysSpanIndex += BlsPublicKey.Length;
            }
            byte[] aggregatePublicKey = new byte[BlsPublicKey.Length];
            bool success = _bls.TryAggregatePublicKeys(publicKeysSpan, aggregatePublicKey, out int bytesWritten);
            if (!success || bytesWritten != BlsPublicKey.Length)
            {
                throw new Exception("Error generating aggregate public key.");
            }
            return new BlsPublicKey(aggregatePublicKey);
        }

        public BlsSignature SignData(BlsPublicKey publicKey, Root signingRoot)
        {
            byte[] signature = new byte[BlsSignature.Length];
            bool success = _bls.TrySignData(publicKey.AsSpan(), signingRoot.AsSpan(), signature, out int bytesWritten);
            if (!success || bytesWritten != BlsPublicKey.Length)
            {
                throw new Exception("Error generating signature for root.");
            }
            return new BlsSignature(signature);
        }

        public bool BlsAggregateVerify(IList<BlsPublicKey> publicKeys, IList<Root> signingRoots, BlsSignature signature)
        {
            int count = publicKeys.Count();

            Span<byte> publicKeysSpan = new Span<byte>(new byte[count * BlsPublicKey.Length]);
            int publicKeysSpanIndex = 0;
            foreach (BlsPublicKey publicKey in publicKeys)
            {
                publicKey.AsSpan().CopyTo(publicKeysSpan.Slice(publicKeysSpanIndex));
                publicKeysSpanIndex += BlsPublicKey.Length;
            }

            Span<byte> signingRootsSpan = new Span<byte>(new byte[count * Root.Length]);
            int signingRootsSpanIndex = 0;
            foreach (Root signingRoot in signingRoots)
            {
                signingRoot.AsSpan().CopyTo(signingRootsSpan.Slice(signingRootsSpanIndex));
                signingRootsSpanIndex += Root.Length;
            }

            return _bls.AggregateVerifyData(publicKeysSpan, signingRootsSpan, signature.AsSpan());
        }

        public bool BlsFastAggregateVerify(IList<BlsPublicKey> publicKeys, Root signingRoot, BlsSignature signature)
        {
            List<byte[]> publicKeysList = new List<byte[]>();
            foreach (BlsPublicKey publicKey in publicKeys)
            {
                publicKeysList.Add(publicKey.Bytes);
            }
            return _bls.FastAggregateVerifyData(publicKeysList, signingRoot.AsSpan(), signature.AsSpan());
        }

        public bool BlsVerify(BlsPublicKey publicKey, Root signingRoot, BlsSignature signature)
        {
            BLSParameters blsParameters = new BLSParameters() { PublicKey = publicKey.AsSpan().ToArray() };
            using BLS signatureAlgorithm = SignatureAlgorithmFactory(blsParameters);
            return signatureAlgorithm.VerifyData(signingRoot.AsSpan(), signature.AsSpan());
        }

        public Root Hash(Root a, Root b)
        {
            Span<byte> input = new Span<byte>(new byte[Bytes32.Length * 2]);
            a.AsSpan().CopyTo(input);
            b.AsSpan().CopyTo(input.Slice(Bytes32.Length));
            return Hash(input);
        }

        public Root Hash(ReadOnlySpan<byte> bytes)
        {
            byte[] result = new byte[Bytes32.Length];
            bool success = s_hashAlgorithm.TryComputeHash(bytes, result, out int bytesWritten);
            if (!success || bytesWritten != Bytes32.Length)
            {
                throw new Exception("Error generating hash value.");
            }
            return new Root(result);
        }
    }
}
