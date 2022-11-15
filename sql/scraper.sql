CREATE TABLE scraper
(
  priority INT UNSIGNED,
  url varchar(100) NOT NULL,
  lastUpdated INT UNSIGNED,
  isWorking BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (url)
);
