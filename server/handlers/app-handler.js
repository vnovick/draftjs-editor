/**
 * Created by vladimirn on 11/27/15.
 */
 import _ from 'lodash';
 import getBundle from '../utils/bundler';
 function renderPage(bundleName){
  return {
    bundle: getBundle(bundleName),
    pdo: {}
  }
 }



export default (bundleName, req, res, next) => {
        req.page = renderPage(bundleName)
        next()
}
