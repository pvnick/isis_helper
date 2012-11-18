CREATE TABLE `teachers` (
    `LastName` varchar(255) NOT NULL DEFAULT '',
    `FullTextName` varchar(255) NOT NULL DEFAULT '',
    `RateMyProfessorID` int(11) NOT NULL DEFAULT '0',
    PRIMARY KEY (`RateMyProfessorID`),
    KEY `LastName` (`LastName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8
