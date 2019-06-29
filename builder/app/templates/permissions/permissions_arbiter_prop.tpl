
        IRedArbiter<{{arbiter}}> _arbiter{{arbiter}};
        public IRedArbiter<{{arbiter}}> arbiter{{arbiter}} 
        {
            get 
            {
                if(_arbiter{{arbiter}} == null)
                {
                    _arbiter{{arbiter}} = RedStrapper.Resolve<IRedArbiter<{{arbiter}}>>();
                }

                return _arbiter{{arbiter}};
            }
        }
