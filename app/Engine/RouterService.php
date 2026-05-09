<?php
namespace App\Engine;
class RouterService {
    protected $routes = [];
    public $request;
    public $response;
    public function __construct($request, $response) {
        $this->request = $request;
        $this->response = $response;
    }
    public function get($path, $callback) {
        $this->routes['get'][$path] = $callback;
    }
    public function post($path, $callback) {
        $this->routes['post'][$path] = $callback;
    }
    public function put($path, $callback) {
        $this->routes['put'][$path] = $callback;
    }
    public function delete($path, $callback) {
        $this->routes['delete'][$path] = $callback;
    }
    public function resolve() {
        $path = $this->request->getPath();
        $method = $this->request->getMethod();
        foreach ($this->routes[$method] ?? [] as $routePath => $callback) {
            $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<\1>[^/]+)', $routePath);
            $pattern = "#^" . $pattern . "$#";
            if (preg_match($pattern, $path, $matches)) {
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                if (is_array($callback)) {
                    $controller = new $callback[0]();
                    $methodName = $callback[1];
                    return $controller->$methodName($this->request, $this->response, ...array_values($params));
                }
                return call_user_func($callback, $this->request, $this->response, ...array_values($params));
            }
        }
        $this->response->json([], 'error', 'Route not found', 404);
    }
}
