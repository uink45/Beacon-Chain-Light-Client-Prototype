using System.Collections;

namespace LightClientV2
{
    public static class BasicVectorExtensions
    {
        public static SszBasicElement ToSszBasicElement(this bool item)
        {
            return new SszBasicElement(item);
        }

        public static SszBasicElement ToSszBasicElement(this ulong item)
        {
            return new SszBasicElement(item);
        }

        public static SszBasicVector ToSszBasicVector(this byte[] item)
        {
            return new SszBasicVector(item);
        }

        public static SszBitlist ToSszBitlist(this BitArray item, ulong limit)
        {
            return new SszBitlist(item, limit);
        }

        public static SszBitvector ToSszBitvector(this BitArray item)
        {
            return new SszBitvector(item);
        }
    }
}
