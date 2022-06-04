const APP_ENV = process.env.APP_ENV;
import { Container } from 'inversify';
import TYPES from '@/diContainer/inversify.types';

const container = new Container();
if (APP_ENV === 'development') {
    
} else if (APP_ENV === 'staging') {

} else if (APP_ENV === 'production') {

}

export default container;