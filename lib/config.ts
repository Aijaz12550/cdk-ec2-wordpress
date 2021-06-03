import * as dotenv from 'dotenv';

dotenv.config();

const env = process.env.ENV || "TEST";

export const config = {
    projectName: process.env.PROJECTNAME,
    
    
    wordpress: {
        admin: {
          username: process.env.WP_ADMIN_USER || 'aijaz',
          email: process.env.WP_ADMIN_EMAIL || 'muhammadaijaz76@gmail.com'
        },
        site: {
          // name of the database WP will use (cannot have hyphens) 
          databaseName: process.env.WP_DB_NAME || 'awesome_wp_site_db',
          // the name of our WP  website
          title: process.env.WP_SITE_TITLE || 'awesome-wp-site',
          // where we will install WP on our instance volume
          installPath: process.env.WP_SITE_INSTALL_PATH || '/var/www/html/',
        }
      },

      env: {
        account: process.env.AWS_ACCOUNT_NUMBER,
        region: process.env.AWS_REGION || 'us-west-2',
      },


}