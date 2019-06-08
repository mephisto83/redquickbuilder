    public class StagedResponse : DBaseData
    {
        public Guid Response { get; set; }
        public bool Failed { get; set; }
        public string ChangeType = { get; set; }
    }