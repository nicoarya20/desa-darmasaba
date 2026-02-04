
# ambil token
curl -X POST https://cld-dkr-makuro-seafile.wibudev.com/api2/auth-token/ \
  -d "username=nico@bip.com" \
  -d "password=Production_123"

# ambil list repo / library

TOKEN=20a19f4a04032215d50ce53292e6abdd38b9f806
# curl -X GET \
#   https://cld-dkr-makuro-seafile.wibudev.com/api2/repos/ \
#   -H "Authorization: Token $TOKEN"

# REPO_NAME=desa-darmasaba
DIR_TARGET=asset-web

REPO_ID=f0e9ee4a-fd13-49a2-81c0-f253951d063a
curl -X GET \
  "https://cld-dkr-makuro-seafile.wibudev.com/api2/repos/$REPO_ID/dir/?p=$DIR_TARGET" \
  -H "Authorization: Token $TOKEN"

# curl -X GET \
#   "https://cld-dkr-makuro-seafile.wibudev.com/api2/repos/$REPO_ID/file/?p=$DIR_TARGET/buku6.jpg" \
#   -H "Authorization: Token $TOKEN"


# curl -X GET \
#   "https://cld-dkr-makuro-seafile.wibudev.com/api2/repos/$REPO_ID/dir/?p=/" \
#   -H "Authorization: Token $TOKEN"

