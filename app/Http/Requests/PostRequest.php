<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title'=> 'nullable|string|max:255',
            'post'=> 'nullable|string|max:5000',
            'image' => 'nullable|image|max:5120',
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|max:5120',
        ];
    }
}
