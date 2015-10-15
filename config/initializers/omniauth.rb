#config/initalizers/omniauth.rb
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2, ENV['305327068123-d58if82b2vsff87momvvqonq44mccr7k.apps.googleusercontent.com'], ENV['fohN8AJn0WhrWXhQZdoUC5Yh'], {
  scope: ['email',
    'https://www.googleapis.com/auth/gmail.modify'],
    access_type: 'offline'}
end