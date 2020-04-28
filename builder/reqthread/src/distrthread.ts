import { RedQuickDistributionMessage } from "../../app/jobs/communicationTower";

export interface DistrThread {
  send(message: RedQuickDistributionMessage);
	onComplete(arg0: (arg:any) => void);
	onChange(args0: (arg:any) => Promise<void>);
	onError(arg0: (arg:any) => void);
}
