CREATE TABLE IF NOT EXISTS servers(
    serverid TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS groups(
    serverid TEXT NOT NULL,
    groupid INTEGER NOT NULL,
    groupname TEXT NOT NULL,
    state INTEGER DEFAULT 0,
    created DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (serverid, groupid)
    FOREIGN KEY (serverid) REFERENCES servers(serverid)
);

CREATE TABLE IF NOT EXISTS groupusers(
    serverid TEXT NOT NULL,
    groupid INTEGER NOT NULL,
    userid TEXT NOT NULL,
    PRIMARY KEY (serverid, groupid, userid),
    FOREIGN KEY (serverid) REFERENCES servers(serverid),
    FOREIGN KEY (groupid) REFERENCES groups(groupid)
);