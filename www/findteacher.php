<?php
ini_set('display_errors', 'on');

$con = mysql_connect('127.0.0.1', 'user', 'pass');
if (!$con)
{
    die('Could not connect: ' . mysql_error());
}

mysql_select_db("isis_help", $con);

if (!isset($_REQUEST["lastname"])) {
    die("Required parameter lastname not set");
}

/*

if (!isset($_REQUEST["uid"])) {
    die("Required parameter uid not set");
}

$uniqueRequestID = (int)$_REQUEST["uid"];
*/

$requestLastName = $_REQUEST["lastname"];
$requestLastName = mysql_escape_string($requestLastName);

$sql = "select
            LastName,
            FullTextName,
            RateMyProfessorID
        from 
            teachers
        where
            LastName = '" . $requestLastName . "'"; 

$result = mysql_query($sql);
$teachers = array();

while($row = mysql_fetch_assoc($result))
{
    $teachers[] = $row;
}

mysql_close($con);

echo(json_encode($teachers));

exit;

echo("function teacherLookupFunction_" . $uniqueRequestID . "(){return " . json_encode($teachers) . "}")

?>
