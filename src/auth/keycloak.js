import Keycloak from 'keycloak-js';
import config from '../config';

const keycloak = new Keycloak({
    url: config.url,
    realm: config.realm,
    clientId: config.clientId,
});

export default keycloak;
