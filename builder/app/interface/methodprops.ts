

export default interface MethodProps {
  GetAll?: MethodDescription;
  Get?: MethodDescription;
  Create?: MethodDescription;
  Delete?: MethodDescription;
  Update?: MethodDescription;
};

export interface MethodDescription {
	functionType: string;
	properties: MethodPropsProperties;
}
export interface MethodPropsProperties {
	parent: string;
	model: string;
	model_output: string;
}
