<?php


$defaultHost = "localhost:8080";
$output = "compile";


?>
<!DOCTYPE html>
<html lang="fr" >
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>BonjourVélo - Complier components JS & CSS</title>
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>

</head>

<body>

  <h1>BonjourVélo, Material Design compiler JS & CSS </h1>


  <p>
    Le compiler permet d'extraire le CSS et le JS des components Material Design du Webpack<br/>
    Pour lancer le Webpack veuillez installer NodeJS et faites "npm start" dans ./webpack-projet
  </p>

  <form class="" action="compiler.php" method="post">
  <div class="output" style="margin: 1rem 0;">
    <label for="fileOutput">Output files : </label>

    <select id="fileOutput" name="fileOutput">
        <option value="compile">_compile (temp folder)</option>
        <option value="components">components files (front/js & /css)</option>
    </select>
  </div>

  <div class="todo">
    <div>
      <input type="checkbox" id="cbCss" name="css" checked>
      <label for="cbCss">Compile CSS</label>
    </div>
    <div>
      <input type="checkbox" id="cbJs" name="js" checked>
      <label for="cbJs">Compile JS</label>
    </div>
    <div style="margin-left: 1rem;">
      <input type="checkbox" id="cbJsForce" name="jsForce">
      <label for="cbJsForce">Force JS compilation</label>
    </div>
    <div style="margin-left: 1rem;">
      <input type="checkbox" id="cbJsConsole" name="jsConsole" checked>
      <label for="cbJsConsole">Hide console</label>
    </div>
  </div>

  <div class="host" style="margin: 1rem 0;">
    <label for="hostInput">Host : </label>
    <input id="hostInput"type="text" name="host" value="<?php echo($defaultHost); ?>"/>
  </div>

  <div class="confirm" style="margin: 1rem 0;">
    <button type="submit">Compile</button>
  </div>
</body>

</html>