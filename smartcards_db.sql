-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2026. Ápr 26. 17:05
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `smartcards_db`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `aspnetroleclaims`
--

CREATE TABLE `aspnetroleclaims` (
  `Id` int(11) NOT NULL,
  `RoleId` varchar(255) NOT NULL,
  `ClaimType` longtext DEFAULT NULL,
  `ClaimValue` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `aspnetroles`
--

CREATE TABLE `aspnetroles` (
  `Id` varchar(255) NOT NULL,
  `Name` varchar(256) DEFAULT NULL,
  `NormalizedName` varchar(256) DEFAULT NULL,
  `ConcurrencyStamp` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `aspnetuserclaims`
--

CREATE TABLE `aspnetuserclaims` (
  `Id` int(11) NOT NULL,
  `UserId` varchar(255) NOT NULL,
  `ClaimType` longtext DEFAULT NULL,
  `ClaimValue` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `aspnetuserlogins`
--

CREATE TABLE `aspnetuserlogins` (
  `LoginProvider` varchar(255) NOT NULL,
  `ProviderKey` varchar(255) NOT NULL,
  `ProviderDisplayName` longtext DEFAULT NULL,
  `UserId` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `aspnetuserroles`
--

CREATE TABLE `aspnetuserroles` (
  `UserId` varchar(255) NOT NULL,
  `RoleId` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `aspnetusers`
--

CREATE TABLE `aspnetusers` (
  `Id` varchar(255) NOT NULL,
  `DisplayName` longtext NOT NULL,
  `RefreshToken` longtext DEFAULT NULL,
  `RefreshTokenExpiry` datetime(6) DEFAULT NULL,
  `Created` datetime(6) NOT NULL,
  `UserName` varchar(256) DEFAULT NULL,
  `NormalizedUserName` varchar(256) DEFAULT NULL,
  `Email` varchar(256) DEFAULT NULL,
  `NormalizedEmail` varchar(256) DEFAULT NULL,
  `EmailConfirmed` tinyint(1) NOT NULL,
  `PasswordHash` longtext DEFAULT NULL,
  `SecurityStamp` longtext DEFAULT NULL,
  `ConcurrencyStamp` longtext DEFAULT NULL,
  `PhoneNumber` longtext DEFAULT NULL,
  `PhoneNumberConfirmed` tinyint(1) NOT NULL,
  `TwoFactorEnabled` tinyint(1) NOT NULL,
  `LockoutEnd` datetime(6) DEFAULT NULL,
  `LockoutEnabled` tinyint(1) NOT NULL,
  `AccessFailedCount` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `aspnetusers`
--

INSERT INTO `aspnetusers` (`Id`, `DisplayName`, `RefreshToken`, `RefreshTokenExpiry`, `Created`, `UserName`, `NormalizedUserName`, `Email`, `NormalizedEmail`, `EmailConfirmed`, `PasswordHash`, `SecurityStamp`, `ConcurrencyStamp`, `PhoneNumber`, `PhoneNumberConfirmed`, `TwoFactorEnabled`, `LockoutEnd`, `LockoutEnabled`, `AccessFailedCount`) VALUES
('bcf19e6a-4e3b-40ea-8b54-abe9fb5502bc', 'teszt-felhasználó11', 's9eVPBU+TI3sfNz9rrIjDuXFiFdGx3hppPYvaj5AuCIKlvK77/Z3a7E7oDfff4trd5RzDFl68kmc0rrGZy8udg==', '2026-05-11 15:04:18.083612', '2026-04-24 17:26:53.635154', 'teszt@teszt.com', 'TESZT@TESZT.COM', 'teszt@teszt.com', 'TESZT@TESZT.COM', 0, 'AQAAAAIAAYagAAAAEFgaiSap7AaO9IjlltS7bLeSE/bi3nGJH4FoENYI6rROqfyM2MvZDsTGxF40Gf+bLw==', 'B4LKYTHSYC4QUUSNAU7KA24LS66BPVAI', '5633a32f-e6f5-4d23-a09c-36161d713dbf', NULL, 0, 0, NULL, 1, 0);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `aspnetusertokens`
--

CREATE TABLE `aspnetusertokens` (
  `UserId` varchar(255) NOT NULL,
  `LoginProvider` varchar(255) NOT NULL,
  `Name` varchar(255) NOT NULL,
  `Value` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `cards`
--

CREATE TABLE `cards` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `DeckId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `Question` longtext NOT NULL,
  `Answer` longtext NOT NULL,
  `CreatedAt` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `cards`
--

INSERT INTO `cards` (`Id`, `DeckId`, `Question`, `Answer`, `CreatedAt`) VALUES
('08dea24a-fa02-4794-89c0-6bbdb973a023', '08dea24a-f3ac-437b-8102-3f6485c78798', 'Teszt kérdés 0', 'Teszt válasz 0', '2026-04-24 21:46:43.893238'),
('08dea24a-fa54-420e-80b5-5a818b609476', '08dea24a-f3ac-437b-8102-3f6485c78798', 'Teszt kérdés 1', 'Teszt válasz 1', '2026-04-24 21:46:44.426868'),
('08dea24a-fa54-4240-82f2-b3f700159ac8', '08dea24a-f3ac-437b-8102-3f6485c78798', 'Teszt kérdés 2', 'Teszt válasz 2', '2026-04-24 21:46:44.425937'),
('08dea24a-fa54-4255-8195-533e132f871b', '08dea24a-f3ac-437b-8102-3f6485c78798', 'Teszt kérdés 3', 'Teszt válasz 3', '2026-04-24 21:46:44.424938'),
('08dea24a-fa54-425a-8469-5ad1e39795ec', '08dea24a-f3ac-437b-8102-3f6485c78798', 'Teszt kérdés 4', 'Teszt válasz 4', '2026-04-24 21:46:44.423938'),
('08dea24a-fa54-425f-8b6d-a0784ca7e29a', '08dea24a-f3ac-437b-8102-3f6485c78798', 'Teszt kérdés 5', 'Teszt válasz 5', '2026-04-24 21:46:44.422938'),
('08dea24a-fa54-4264-8590-60490b38ae1e', '08dea24a-f3ac-437b-8102-3f6485c78798', 'Teszt kérdés 6', 'Teszt válasz 6', '2026-04-24 21:46:44.421942'),
('08dea24a-fa54-4268-8906-54a7fd101615', '08dea24a-f3ac-437b-8102-3f6485c78798', 'Teszt kérdés 7', 'Teszt válasz 7', '2026-04-24 21:46:44.420943'),
('08dea24a-fa54-426c-8faa-8ab9d76fbc5c', '08dea24a-f3ac-437b-8102-3f6485c78798', 'Teszt kérdés 8', 'Teszt válasz 8', '2026-04-24 21:46:44.419944'),
('08dea24a-fa54-4273-802d-90f6f5c40951', '08dea24a-f3ac-437b-8102-3f6485c78798', 'Teszt kérdés 9', 'Teszt válasz 9', '2026-04-24 21:46:44.418944'),
('08dea24a-fa54-4277-8268-d92b2a76100f', '08dea24a-f3ac-437b-8102-3f6485c78798', 'Teszt kérdés 10', 'Teszt válasz 10', '2026-04-24 21:46:44.417946'),
('08dea24a-fa54-427c-8b36-52c57d42b82d', '08dea24a-f3ac-437b-8102-3f6485c78798', 'Teszt kérdés 11', 'Teszt válasz 11', '2026-04-24 21:46:44.416946'),
('08dea24a-fe31-40c0-8124-762ddb051435', '08dea24a-f3ac-437b-8102-3f6485c78798', 'Teszt kérdés 12', 'Teszt válasz 12', '2026-04-24 21:46:50.909524');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `cardstats`
--

CREATE TABLE `cardstats` (
  `Id` bigint(20) NOT NULL,
  `AppUserId` varchar(255) NOT NULL,
  `CardId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `BatchIndex` int(11) NOT NULL,
  `RotationPoints` int(11) NOT NULL,
  `RotationIndex` int(11) NOT NULL,
  `IsMastered` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `cardstats`
--

INSERT INTO `cardstats` (`Id`, `AppUserId`, `CardId`, `BatchIndex`, `RotationPoints`, `RotationIndex`, `IsMastered`) VALUES
(12, 'bcf19e6a-4e3b-40ea-8b54-abe9fb5502bc', '08dea24a-fa02-4794-89c0-6bbdb973a023', 0, 0, 0, 1),
(13, 'bcf19e6a-4e3b-40ea-8b54-abe9fb5502bc', '08dea24a-fa54-420e-80b5-5a818b609476', 1, 13, 1, 0),
(14, 'bcf19e6a-4e3b-40ea-8b54-abe9fb5502bc', '08dea24a-fa54-4240-82f2-b3f700159ac8', 1, 17, 1, 0),
(15, 'bcf19e6a-4e3b-40ea-8b54-abe9fb5502bc', '08dea24a-fa54-4255-8195-533e132f871b', 1, 21, 2, 0),
(16, 'bcf19e6a-4e3b-40ea-8b54-abe9fb5502bc', '08dea24a-fa54-425a-8469-5ad1e39795ec', 1, 21, 2, 0),
(17, 'bcf19e6a-4e3b-40ea-8b54-abe9fb5502bc', '08dea24a-fa54-425f-8b6d-a0784ca7e29a', 0, 0, 0, 1),
(18, 'bcf19e6a-4e3b-40ea-8b54-abe9fb5502bc', '08dea24a-fa54-4264-8590-60490b38ae1e', 0, 0, 0, 1),
(19, 'bcf19e6a-4e3b-40ea-8b54-abe9fb5502bc', '08dea24a-fa54-4268-8906-54a7fd101615', 3, 0, 0, 0),
(20, 'bcf19e6a-4e3b-40ea-8b54-abe9fb5502bc', '08dea24a-fa54-426c-8faa-8ab9d76fbc5c', 3, 0, 0, 0),
(21, 'bcf19e6a-4e3b-40ea-8b54-abe9fb5502bc', '08dea24a-fa54-4273-802d-90f6f5c40951', 2, 0, 0, 0),
(22, 'bcf19e6a-4e3b-40ea-8b54-abe9fb5502bc', '08dea24a-fa54-4277-8268-d92b2a76100f', 2, 0, 0, 0),
(23, 'bcf19e6a-4e3b-40ea-8b54-abe9fb5502bc', '08dea24a-fa54-427c-8b36-52c57d42b82d', 2, 0, 0, 0),
(24, 'bcf19e6a-4e3b-40ea-8b54-abe9fb5502bc', '08dea24a-fe31-40c0-8124-762ddb051435', 0, 0, 0, 1);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `decks`
--

CREATE TABLE `decks` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `AppUserId` varchar(255) NOT NULL,
  `Title` varchar(255) NOT NULL,
  `Description` longtext DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `decks`
--

INSERT INTO `decks` (`Id`, `AppUserId`, `Title`, `Description`, `CreatedAt`) VALUES
('08dea24a-f3ac-437b-8102-3f6485c78798', 'bcf19e6a-4e3b-40ea-8b54-abe9fb5502bc', 'TesztPakli', 'Teszt leírás, teszt leírás, teszt leírás.', '2026-04-24 21:46:33.254419');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `deckstats`
--

CREATE TABLE `deckstats` (
  `Id` bigint(20) NOT NULL,
  `AppUserId` varchar(255) NOT NULL,
  `DeckId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `KnowledgePercentage` int(11) NOT NULL,
  `TimeSpentMinutes` int(11) NOT NULL,
  `LastPlayedAt` datetime(6) NOT NULL,
  `Goal` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `deckstats`
--

INSERT INTO `deckstats` (`Id`, `AppUserId`, `DeckId`, `KnowledgePercentage`, `TimeSpentMinutes`, `LastPlayedAt`, `Goal`) VALUES
(2, 'bcf19e6a-4e3b-40ea-8b54-abe9fb5502bc', '08dea24a-f3ac-437b-8102-3f6485c78798', 31, 1, '2026-04-26 15:03:05.388000', 'days');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `userstats`
--

CREATE TABLE `userstats` (
  `AppUserId` varchar(255) NOT NULL,
  `FlippedCardsTotal` bigint(20) NOT NULL,
  `FlippedCardsToday` int(11) NOT NULL,
  `LearningStreak` int(11) NOT NULL,
  `TotalDecks` int(11) NOT NULL,
  `TotalCards` bigint(20) NOT NULL,
  `TotalMasteredCards` bigint(20) NOT NULL,
  `LastFlipAt` datetime(6) NOT NULL,
  `WeeklyActivityJson` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `userstats`
--

INSERT INTO `userstats` (`AppUserId`, `FlippedCardsTotal`, `FlippedCardsToday`, `LearningStreak`, `TotalDecks`, `TotalCards`, `TotalMasteredCards`, `LastFlipAt`, `WeeklyActivityJson`) VALUES
('bcf19e6a-4e3b-40ea-8b54-abe9fb5502bc', 100, 26, 1, 1, 13, 9, '2026-04-26 15:03:05.388000', '[0,0,0,0,1,0,1]');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `__efmigrationshistory`
--

CREATE TABLE `__efmigrationshistory` (
  `MigrationId` varchar(150) NOT NULL,
  `ProductVersion` varchar(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `__efmigrationshistory`
--

INSERT INTO `__efmigrationshistory` (`MigrationId`, `ProductVersion`) VALUES
('20260424172250_InitialMySQL', '9.0.0');

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `aspnetroleclaims`
--
ALTER TABLE `aspnetroleclaims`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_AspNetRoleClaims_RoleId` (`RoleId`);

--
-- A tábla indexei `aspnetroles`
--
ALTER TABLE `aspnetroles`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `RoleNameIndex` (`NormalizedName`);

--
-- A tábla indexei `aspnetuserclaims`
--
ALTER TABLE `aspnetuserclaims`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_AspNetUserClaims_UserId` (`UserId`);

--
-- A tábla indexei `aspnetuserlogins`
--
ALTER TABLE `aspnetuserlogins`
  ADD PRIMARY KEY (`LoginProvider`,`ProviderKey`),
  ADD KEY `IX_AspNetUserLogins_UserId` (`UserId`);

--
-- A tábla indexei `aspnetuserroles`
--
ALTER TABLE `aspnetuserroles`
  ADD PRIMARY KEY (`UserId`,`RoleId`),
  ADD KEY `IX_AspNetUserRoles_RoleId` (`RoleId`);

--
-- A tábla indexei `aspnetusers`
--
ALTER TABLE `aspnetusers`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `UserNameIndex` (`NormalizedUserName`),
  ADD KEY `EmailIndex` (`NormalizedEmail`);

--
-- A tábla indexei `aspnetusertokens`
--
ALTER TABLE `aspnetusertokens`
  ADD PRIMARY KEY (`UserId`,`LoginProvider`,`Name`);

--
-- A tábla indexei `cards`
--
ALTER TABLE `cards`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_Cards_DeckId` (`DeckId`);

--
-- A tábla indexei `cardstats`
--
ALTER TABLE `cardstats`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_CardStats_AppUserId` (`AppUserId`),
  ADD KEY `IX_CardStats_CardId` (`CardId`);

--
-- A tábla indexei `decks`
--
ALTER TABLE `decks`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_Decks_AppUserId` (`AppUserId`);

--
-- A tábla indexei `deckstats`
--
ALTER TABLE `deckstats`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_DeckStats_AppUserId` (`AppUserId`),
  ADD KEY `IX_DeckStats_DeckId` (`DeckId`);

--
-- A tábla indexei `userstats`
--
ALTER TABLE `userstats`
  ADD PRIMARY KEY (`AppUserId`);

--
-- A tábla indexei `__efmigrationshistory`
--
ALTER TABLE `__efmigrationshistory`
  ADD PRIMARY KEY (`MigrationId`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `aspnetroleclaims`
--
ALTER TABLE `aspnetroleclaims`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `aspnetuserclaims`
--
ALTER TABLE `aspnetuserclaims`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `cardstats`
--
ALTER TABLE `cardstats`
  MODIFY `Id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT a táblához `deckstats`
--
ALTER TABLE `deckstats`
  MODIFY `Id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `aspnetroleclaims`
--
ALTER TABLE `aspnetroleclaims`
  ADD CONSTRAINT `FK_AspNetRoleClaims_AspNetRoles_RoleId` FOREIGN KEY (`RoleId`) REFERENCES `aspnetroles` (`Id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `aspnetuserclaims`
--
ALTER TABLE `aspnetuserclaims`
  ADD CONSTRAINT `FK_AspNetUserClaims_AspNetUsers_UserId` FOREIGN KEY (`UserId`) REFERENCES `aspnetusers` (`Id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `aspnetuserlogins`
--
ALTER TABLE `aspnetuserlogins`
  ADD CONSTRAINT `FK_AspNetUserLogins_AspNetUsers_UserId` FOREIGN KEY (`UserId`) REFERENCES `aspnetusers` (`Id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `aspnetuserroles`
--
ALTER TABLE `aspnetuserroles`
  ADD CONSTRAINT `FK_AspNetUserRoles_AspNetRoles_RoleId` FOREIGN KEY (`RoleId`) REFERENCES `aspnetroles` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_AspNetUserRoles_AspNetUsers_UserId` FOREIGN KEY (`UserId`) REFERENCES `aspnetusers` (`Id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `aspnetusertokens`
--
ALTER TABLE `aspnetusertokens`
  ADD CONSTRAINT `FK_AspNetUserTokens_AspNetUsers_UserId` FOREIGN KEY (`UserId`) REFERENCES `aspnetusers` (`Id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `cards`
--
ALTER TABLE `cards`
  ADD CONSTRAINT `FK_Cards_Decks_DeckId` FOREIGN KEY (`DeckId`) REFERENCES `decks` (`Id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `cardstats`
--
ALTER TABLE `cardstats`
  ADD CONSTRAINT `FK_CardStats_AspNetUsers_AppUserId` FOREIGN KEY (`AppUserId`) REFERENCES `aspnetusers` (`Id`),
  ADD CONSTRAINT `FK_CardStats_Cards_CardId` FOREIGN KEY (`CardId`) REFERENCES `cards` (`Id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `decks`
--
ALTER TABLE `decks`
  ADD CONSTRAINT `FK_Decks_AspNetUsers_AppUserId` FOREIGN KEY (`AppUserId`) REFERENCES `aspnetusers` (`Id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `deckstats`
--
ALTER TABLE `deckstats`
  ADD CONSTRAINT `FK_DeckStats_AspNetUsers_AppUserId` FOREIGN KEY (`AppUserId`) REFERENCES `aspnetusers` (`Id`),
  ADD CONSTRAINT `FK_DeckStats_Decks_DeckId` FOREIGN KEY (`DeckId`) REFERENCES `decks` (`Id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `userstats`
--
ALTER TABLE `userstats`
  ADD CONSTRAINT `FK_UserStats_AspNetUsers_AppUserId` FOREIGN KEY (`AppUserId`) REFERENCES `aspnetusers` (`Id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
