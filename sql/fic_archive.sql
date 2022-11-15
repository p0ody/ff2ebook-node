CREATE TABLE fic_archive
(
  id INT UNSIGNED NOT NULL,
  site varchar(10) NOT NULL,
  title varchar(100),
  author varchar(100),
  updated INT UNSIGNED,
  filename varchar(35),
  lastDL INT UNSIGNED DEFAULT 0,
  lastChecked INT UNSIGNED DEFAULT 0,
  PRIMARY KEY (id, site)
);
