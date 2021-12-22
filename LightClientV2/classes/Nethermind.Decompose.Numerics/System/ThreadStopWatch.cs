using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.InteropServices;

namespace Nethermind.Decompose.Numerics
{
    public class ThreadStopwatch
    {
        [DllImport("kernel32.dll")]
        private static extern long GetThreadTimes
            (IntPtr threadHandle, out long createionTime,
             out long exitTime, out long kernelTime, out long userTime);

        [DllImport("kernel32.dll")]
        private static extern IntPtr GetCurrentThread();

        private long m_endTimeStamp;
        private long m_startTimeStamp;

        private bool m_isRunning;

        public static long Frequency
        {
            get { return (long)10000000; }
        }

        public void Restart()
        {
            Reset();
            Start();
        }

        public void Start()
        {
            m_isRunning = true;

            long timestamp = GetThreadTimes();
            m_startTimeStamp = timestamp;
        }

        public void Stop()
        {
            m_isRunning = false;

            long timestamp = GetThreadTimes();
            m_endTimeStamp = timestamp;
        }

        public void Reset()
        {
            m_startTimeStamp = 0;
            m_endTimeStamp = 0;
        }

        public long ElapsedTicks
        {
            get
            {
                if (m_isRunning)
                    return GetThreadTimes() - m_startTimeStamp;
                return m_endTimeStamp - m_startTimeStamp;
            }
        }

        public TimeSpan Elapsed
        {
            get
            {
                return TimeSpan.FromMilliseconds((double)ElapsedTicks / Frequency);
            }
        }

        public bool IsRunning
        {
            get { return m_isRunning; }
        }

        private long GetThreadTimes()
        {
            IntPtr threadHandle = GetCurrentThread();

            long notIntersting;
            long kernelTime, userTime;

            long retcode = GetThreadTimes
                (threadHandle, out notIntersting,
                out notIntersting, out kernelTime, out userTime);

            bool success = Convert.ToBoolean(retcode);
            if (!success)
                throw new Exception(string.Format
                ("failed to get timestamp. error code: {0}", 
                retcode));

            long result = kernelTime + userTime;
            return result;
        }
    }}
