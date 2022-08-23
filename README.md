# psql-partition-table-demo

PostgreSQL Partition Table dump/restore Demo

## Launch docker-compose

```sh
$ docker compose up -d
```

## Generate Test CSV

```sh
# generate of Year => YYYY (ex "2021"
# generate row count => N (ex "1000000"
$ yarn --cwd generator generate ${generate of Year} ${generate row count}
```

## Migrate Source DB

```sh
$ docker run --rm \
    --network sandbox \
    -v "${PWD}/sql:/flyway/sql" \
    flyway/flyway \
    -cleanDisabled=false \
    -url="jdbc:postgresql://${SOURCE_POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}" \
    -user="${POSTGRES_USER}" \
    -password="${POSTGRES_PASSWORD}" \
    migrate
```

## Import Test CSV to Source DB

```sh
$ docker compose exec -it source-db /bin/bash
root@95e5c9a045fb:/# psql -U ${POSTGRES_USER} -d ${POSTGRES_DB}
psql (14.5 (Debian 14.5-1.pgdg110+1))
Type "help" for help.

sandbox_db=# \COPY deposit FROM /usr/share/app/generator/deposit-y2020-5000000row.csv DELIMITER ',' CSV;
COPY 5000000
sandbox_db=# \COPY deposit FROM /usr/share/app/generator/deposit-y2021-5000000row.csv DELIMITER ',' CSV;
COPY 5000000
```

## pg_dump from Source DB

```sh
$ docker compose exec -it source-db /bin/bash
root@95e5c9a045fb:/# pg_dump -v -U ${POSTGRES_USER} \
  --dbname=${POSTGRES_DB} \
  --schema=public \
  --table="deposit|deposit_y*m*" \
  --load-via-partition-root \
  --format=custom \
  --file=/usr/share/app/dump_source-db.tar.gz
```

## pg_restore to Destination DB

```sh
$ docker compose exec -it dest-db /bin/bash
root@63ec446c52a7:/# pg_restore -v --exit-on-error -U ${POSTGRES_USER} \
  --dbname=${POSTGRES_DB} \
  --format=custom \
  /usr/share/app/dump_source-db.tar.gz
```
