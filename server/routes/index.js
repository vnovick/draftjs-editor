/**
 * Created by vladimirn on 11/27/15.
 */
import appHandler from '../handlers/app-handler';
import home from '../controllers/homeController'
export default (app) => {
    app.get('/', appHandler.bind(null, 'app'), home);
    app.get('/preview', appHandler.bind(null, 'preview'), home);
    app.get('/poc', appHandler.bind(null, 'poc'), home);
}
