using System;
using System.Diagnostics;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;
using System.IO;

namespace LightClientV2 
{
    public class RetrieveData
    {
        public string query;
        public string StateId;
        public readonly string textFile = "";
            
        public RetrieveData()
        {
            query = "";
            StateId = "";
        }

        public void SetQuery(string path)
        {
            query = path;
        }

        public List<Datum> QuerySyncCommittee(string stateId)
        {
            string query = "/eth/v1/beacon/states/" + stateId + "/sync_committees";
            SetQuery(query);
            StateId = stateId;
            List<string> validatorIndexes = ParseValidatorIndexes(query.ToString());
            SetQuery(ConvertToQuery(validatorIndexes));
            return ParseValidatorPublicKeys(query.ToString());
        }

        public string ConvertToQuery(List<string> list)
        {
            string query = "";
            for (int i = 0; i < list.Count; i++)
            {
                if (i == 0)
                {
                    query += "/eth/v1/beacon/states/"+ StateId + "/validators?id=" + list[i];
                }
                else
                {
                    query += "&id=" + list[i];
                }
            }
            return query;
        }

        public List<string> ParseValidatorIndexes(string text)
        {
            SyncRoot myDeserializedClass = JsonConvert.DeserializeObject<SyncRoot>(text);
            return myDeserializedClass.data.validators;
        }

        public List<Datum> ParseValidatorPublicKeys(string text)
        {
            PubKeyRoot myDeserializedClass = JsonConvert.DeserializeObject<PubKeyRoot>(text);
            return myDeserializedClass.data;
        }

        public UpdateRoot ParseLightClientUpdate()
        {
            string text = File.ReadAllText(textFile);
            return JsonConvert.DeserializeObject<UpdateRoot>(text); ;
        }

        public Snapshot.Root ParseSnapshot(string text)
        {
            return JsonConvert.DeserializeObject<Snapshot.Root>(text);
        }

    }
}
