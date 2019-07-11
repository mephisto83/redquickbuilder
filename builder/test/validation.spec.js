import * as NodeTypes from '../app/constants/nodetypes';

describe('description', () => {
  it('should have description', () => {
    expect(1 + 2).toBe(3);
  });
});

describe('validation relationship', () => {
  it('should get the validations for a type', () => {
    var validations = NodeTypes.GetValidationsFor(NodeTypes.NodePropertyTypes.STRING);
    expect(Object.keys(validations).length).toBeTruthy();
  });

  it('should get the parent of a validation vector', () => {
    var parent = NodeTypes.GetValidationParents(NodeTypes.ValidationRules.SocialSecurity, NodeTypes.ValidationVector.Content);
    expect(parent[0]).toBeTruthy();
    expect(parent[0].id).toBe(NodeTypes.ValidationRules.AlphaNumericPuncLike);
  });
  it('should return list of more compatibles', () => {
    var compatibles = NodeTypes.GetMoreCompatibles(NodeTypes.ValidationRules.SocialSecurity, NodeTypes.ValidationVector.Content);
    expect(compatibles.length).toBeTruthy();
  })
  it('should return if the validations are compatible', () => {
    var compatible = NodeTypes.AreCompatible(NodeTypes.ValidationRules.SocialSecurity, NodeTypes.ValidationVector.Numeric);
    expect(compatible).toBe(false);
  });

  it('should return -1 if the validation a is less restrictive than validation b', () => {
    var val = NodeTypes.SortValidation(NodeTypes.ValidationRules.SocialSecurity, NodeTypes.ValidationRules.AlphaNumericPuncLike, NodeTypes.ValidationVector.Content);
    expect(val).toBe(-1);
  });
  
  it('should return 1 if the validation a is more restrictive than validation b', () => {
    var val = NodeTypes.SortValidation(NodeTypes.ValidationRules.AlphaNumericPuncLike, NodeTypes.ValidationRules.SocialSecurity, NodeTypes.ValidationVector.Content);
    expect(val).toBe(1);
  });
  
  it('should return 0 if the validation a is the same level of  validation b', () => {
    var val = NodeTypes.SortValidation(NodeTypes.ValidationRules.SocialSecurity, NodeTypes.ValidationRules.SocialSecurity, NodeTypes.ValidationVector.Content);
    expect(val).toBe(0);
  });
  
  it('should return 0 if the validation a incompatible the same level of  validation b', () => {
    var val = NodeTypes.SortValidation(NodeTypes.ValidationRules.SocialSecurity, NodeTypes.ValidationRules.Zip, NodeTypes.ValidationVector.Content);
    expect(val).toBe(0);
  });

});