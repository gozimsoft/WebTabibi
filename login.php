<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Login Test</title>
</head>
<body>
    <h2>Login Form</h2>
    <form method="post">
        <label>Username or Phone or Email:</label><br>
        <input type="text" name="username" required><br><br>

        <label>Password:</label><br>
        <input type="password" name="password" required><br><br>

        <input type="submit" value="Login">
    </form>

    <?php
    
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $data = [
            "username" => $_POST["username"],
            "password" => $_POST["password"]
        ];

        $options = [
            "http" => [
                "header"  => "Content-Type: application/json",
                "method"  => "POST",
                "content" => json_encode($data)
            ]
        ];
        $context  = stream_context_create($options);
        $result = file_get_contents("http://localhost/tabibi/api/v1/login.php", false, $context);
                    
        echo "<h3>Response:</h3>";
        echo "<pre>$result</pre>";
    }
    ?>
</body>
</html>
