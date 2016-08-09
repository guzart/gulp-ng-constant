
import angular from 'angular';

const env = angular.module("my.module.config", ["ngAnimate"])
  .constant("myFirstCnt", true)
  .constant("mySecondCnt", {"hello":"world"})
  .constant("myPropCnt", "hola!");


export default env;

