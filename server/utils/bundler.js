/**
 * Created by vladimirn on 11/28/15.
 */
export default (bundleName)=>{
    let isDev = process.env.NODE_ENV === 'development';
    let bundle = {
        poc: {
          js: 'poc.js',
          css: 'styles.css'
        },
        app: {
          js: 'app.js',
          css: 'styles.css'
        }
    };
    for (var key in bundle[bundleName]) {
        bundle[bundleName][key] = isDev ? `http://localhost:8080/public/assets/${bundle[bundleName][key]}` : `assets/${bundle[bundleName][key]}`;
    }
    return bundle[bundleName]
}
