OmniAuth.config.logger = Rails.logger

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2, '105083838432-cb5dgkksbooh2n68f47c61dogvnqojvh.apps.googleusercontent.com', 'dTPQlOltsKtYVpDO4tsvxrrv', {client_options: {ssl: {ca_file: Rails.root.join("cacert.pem").to_s}}}
  
end