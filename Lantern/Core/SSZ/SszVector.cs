using System.Collections.Generic;

namespace Lantern
{
    public class SszVector : SszComposite
    {
        private readonly IEnumerable<SszComposite> _values;

        public SszVector(IEnumerable<SszComposite> values)
        {
            _values = values;
        }

        public override SszElementType ElementType => SszElementType.Vector;

        public IEnumerable<SszComposite> GetValues() => _values;
    }
}
