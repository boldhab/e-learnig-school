<?php

namespace App\Helpers;

use Exception;

class CloudinaryHelper {
    private string $cloudName;
    private string $apiKey;
    private string $apiSecret;

    public function __construct() {
        $config = require __DIR__ . '/../../config/cloudinary.php';
        $this->cloudName = $config['cloud_name'];
        $this->apiKey = $config['api_key'];
        $this->apiSecret = $config['api_secret'];
    }

    public function upload(string $filePath, string $resourceType = 'auto', array $options = []): array {
        if (empty($this->cloudName) || empty($this->apiKey) || empty($this->apiSecret)) {
            throw new Exception("Cloudinary credentials not configured.");
        }

        $url = "https://api.cloudinary.com/v1_1/{$this->cloudName}/{$resourceType}/upload";
        
        $timestamp = time();
        $params = array_merge($options, [
            'timestamp' => $timestamp,
            'api_key' => $this->apiKey
        ]);

        // Generate signature
        $paramsToSign = $params;
        unset($paramsToSign['api_key']);
        unset($paramsToSign['file']);
        unset($paramsToSign['resource_type']); // resource_type is part of the URL, not the signature usually
        ksort($paramsToSign);
        
        $signString = "";
        foreach ($paramsToSign as $key => $value) {
            $signString .= "$key=$value&";
        }
        $signString = rtrim($signString, '&') . $this->apiSecret;
        $params['signature'] = sha1($signString);

        // Prepare file for CURL
        $params['file'] = new \CURLFile($filePath);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        $response = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new Exception("CURL Error: $error");
        }

        $result = json_decode($response, true);
        if (isset($result['error'])) {
            throw new Exception("Cloudinary Error: " . $result['error']['message']);
        }

        return $result;
    }

    public function delete(string $publicId, string $resourceType = 'image'): bool {
        // Deletion requires Admin API or a different endpoint
        // For simplicity, we'll focus on upload first.
        // Cloudinary Admin API: https://api.cloudinary.com/v1_1/<cloud_name>/resources/image/upload
        // Requires Basic Auth with api_key:api_secret
        
        $url = "https://api.cloudinary.com/v1_1/{$this->cloudName}/resources/{$resourceType}/upload?public_ids[]={$publicId}";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
        curl_setopt($ch, CURLOPT_USERPWD, "{$this->apiKey}:{$this->apiSecret}");
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        $response = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) return false;
        
        $result = json_decode($response, true);
        return isset($result['deleted']);
    }
}
