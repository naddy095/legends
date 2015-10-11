class PlaygroundsController < ApplicationController
  require 'jwt/json'

  before_action :authenticate_user!, only: [:admin]
  before_action :set_playground, only: [:show, :edit, :update, :destroy]
  # before_action :authenticate_house_registration, only: [:create]
  
  respond_to :html
  
  # 404
  rescue_from ActiveRecord::RecordNotFound do |exception| 
    rescue_record_not_found(exception)
  end

  # GET /playgrounds
  # GET /playgrounds.json
  def index
    if params[:id]
      puts"ASSSSSSS"
    else
      
    @playgrounds = Playground.where(:status_id =>true)
    @json = @playgrounds.to_gmaps4rails do |playground, marker|
      @playground = playground
      marker.infowindow render_to_string(:action => 'show', :layout => false)    
      marker.json({ :id => @playground.id })
    end
   end
  end

  # GET /playgrounds/1
  # GET /playgrounds/1.json
  def show
    respond_with(@playground, :layout =>  !request.xhr?)
  end

  # GET /playgrounds/new
  def new
    @playground = Playground.new(params[:playground].present? ? playground_params : nil)
    respond_with(@playground, :layout => !request.xhr?)
  end

  # GET /playgrounds/1/edit
  def edit
    respond_to do |format|
      format.js {}
      format.html {}
    end
  end

  # POST /playgrounds
  # POST /playgrounds.json
  def create
    @playground_exist = User.find(current_user.id).playground

    if @playground_exist.nil?
    @playground = Playground.new(playground_params)
    if params[:home_type] && params[:home_type]=="house"
      @playground.myadd_type_id=1
    elsif params[:home_type] && params[:home_type]=="apartment"
      @playground.myadd_type_id=2
    elsif params[:home_type] && params[:home_type]=="building"
      @playground.myadd_type_id=3
    end
    country = params[:playground][:country][0..1].upcase
    state = params[:playground][:state][0..1].upcase
    city = params[:playground][:city][0..1].upcase
    postal = params[:playground][:postal_code].split('').last(2).join('')
    unicode = ([*('0'..'9')]).sample(4).join
    code = [postal,unicode].join('') 
    address_bar = [country,state,city,code].join('-')

    @playground.address_bar_index = address_bar
    @playground.user_id = current_user.id
    respond_to do |format|
      if @playground.save
        format.html { redirect_to @playground, notice: 'Playground was successfully created.' }
        format.js {}
      else
        format.html { render action: 'new' }
        format.js {}      
      end
    end
  else
    respond_to do |format|
    #format.html { redirect_to @playground, notice: 'Playground is already created by current user' }
        format.js {}
      end
  end
  end

  # PATCH/PUT /playgrounds/1
  # PATCH/PUT /playgrounds/1.json
  def update
    respond_to do |format|
      if @playground.update(playground_params)
          if params[:home_type] && params[:home_type]=="house"
          @playground.update(:myadd_type_id=>1)
          elsif params[:home_type] && params[:home_type]=="apartment"
          @playground.update(:myadd_type_id=>2)
          elsif params[:home_type] && params[:home_type]=="building"
          @playground.update(:myadd_type_id=>3)
          end
        format.html { redirect_to @playground, notice: 'Playground was successfully updated.' }
        format.js {}  
      else
        format.html { render action: 'edit' }
        format.js {}  
      end
    end
  end

  # DELETE /playgrounds/1
  # DELETE /playgrounds/1.json
  def destroy
    user = User.find_by(:email => "admin@myadd.com")
    
    if (user.id != @playground.user_id)
      u = User.find(@playground.user_id) if @playground && @playground.user_id
      if !u.nil?
          u.delete
      end
    end
    @playground.delete

    respond_to do |format|
      format.html { redirect_to playgrounds_url }
      format.js {}  
    end
  end

  def admin
   @pending_playgrounds = Playground.where(:status_id => false || nil)
   @approved_playgrounds = Playground.where(:status_id => true)
   @spam_playgrounds = Playground.where(:is_spam => true)
  end

  def update_house_status
    if params[:id]
       playground =  Playground.find(params[:id])
       playground.update(:status_id => params[:status] == "true" ? true  : false)
    end
 
  end
 def authenticate_house_registration

# render :format => :js
  end

  def update_spam

    @playground = Playground.find(params[:playground_id].to_i)
    @playground.update(:is_spam =>true, :spam_details => params[:spam_desc])
    render :nothing => true, :status => 200, :content_type => 'text/html'
  end

private
  # Use callbacks to share common setup or constraints between actions.
  def set_playground
    @playground = Playground.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def playground_params
    params.require(:playground).permit(:name, :address, :latitude, :longitude, :street_number, :route, :city, :country, :postal_code, :state, :address_bar_index, :myadd_type_id, :hint, :user_id, :myadd_added_date, :myadd_approved_date, :status_id, :is_spam, :created_by, :last_updated_by, :image,:image1, :logo, :picture)
  end
  
  # Generic not found action
  def rescue_record_not_found(exception)
    respond_to do |format|
      format.html
      format.js { render :template => "playgrounds/404.js.erb", :locals => {:exception => exception} }
    end
  end

  
end
