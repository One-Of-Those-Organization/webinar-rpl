#!/usr/bin/env sh

set -e

test1()
{
    curl -X POST \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Commrade Goad",
            "pass": "secure-password123",
            "email": "commrade@example.com",
            "instance": "University XYZ",
            "role": 0,
            "picture": "https://example.com/avatar.jpg"
        }' \
            localhost:3000/api/register
    echo ""
}

test2()
{
    curl -X POST \
        -H "Content-Type: application/json" \
        -d '{
            "pass": "secure-password123",
            "email": "commrade@example.com",
        }' \
            localhost:3000/api/login
    echo ""
}

test3()
{
    curl -X POST \
        -H "Content-Type: application/json" \
        -d '{
            "pass": "cobamatt",
            "email": "matt@example.com",
        }' \
            localhost:3000/api/login
    echo ""
}

echo -e " :: Use 'source test.sh' to use the test function manually. :: "
echo -e " :: Use './test.sh run-from-start' to start the test. :: "
echo -e " :: Use './test.sh run-from-start-noclear' to start the test. :: "
echo -e "   * test1 (POST set name)"
echo -e "   * test2 (GET get name)"

if [ -z "$1" ]; then exit; fi

if [ "$1" = "run-from-start" ]; then
    ./webrpl &
    sleep 0.2
    test1
    test2
    test3

    pkill webrpl
    rm ./cookies.txt
    rm ./db/sessions.db
fi

if [ "$1" = "run-from-start-noclear" ]; then
    ./webrpl &
    sleep 0.2
    test1
    test2

    pkill webrpl
fi
