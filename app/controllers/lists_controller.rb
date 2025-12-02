class ListsController < ApplicationController
  skip_before_action :authenticate_user!, only: [:index, :show]

  def index
    @lists = List.all
  end

  def show
    @list = List.find(params[:id])
  end

  def new
    @list = current_user.lists.new
  end

  def create
    @list = current_user.lists.new(list_params)
    if @list.save
      redirect_to list_path(@list), notice: "List created successfully!"
    else
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    @list = List.find(params[:id])
    ensure_list_owner!

    @list.destroy
    redirect_to lists_path, status: :see_other
  end

  private

  def list_params
    params.require(:list).permit(:name)
  end

  def ensure_list_owner!
    unless @list.user == current_user
      redirect_to lists_path, alert: "You can only delete your own lists."
    end
  end
end
