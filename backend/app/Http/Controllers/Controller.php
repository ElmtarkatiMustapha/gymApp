<?php

namespace App\Http\Controllers;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
abstract class Controller
{
    /**
     * upload picture for the first time
     * @param picture
     * @return pictureName
     */
    public function upload_picture($picture)
    {
        $pictureName = time() . '.' . $picture->extension();
        $picture->storeAs("images", $pictureName);
        return $pictureName;
    }
    /**
     * update picture 
     * @param picture
     * @param object Model
     * @return pictureName
     */
    public function update_picture($picture,Model $model){
        Storage::delete("images/" . $model->picture);
        $pictureName = time() . '.' . $picture->extension();
        $picture->storeAs("images", $pictureName);
        return $pictureName;
    }
    /**
     * delete image
     */
    public function delete_picture(Model $model)
    {
        Storage::delete("images/" . $model->picture);
    }
}
