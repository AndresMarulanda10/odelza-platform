#!/bin/sh

if [ -z "$REACT_APP_SERVER_BASE_URL" ]; then
  echo "Error: REACT_APP_SERVER_BASE_URL is not set."
  exit 1
fi

echo "Injecting runtime environment variables into index.html..."

CONFIG_BLOCK=$(cat << EOF
    <script id="odelza-env-config">
      window._env_ = {
        REACT_APP_SERVER_BASE_URL: "$REACT_APP_SERVER_BASE_URL"
      };
    </script>
    <!-- END: Odelza Config -->
EOF
)
# Use sed to replace the config block in index.html
# Using pattern space to match across multiple lines
echo "$CONFIG_BLOCK" | sed -i.bak '
  /<!-- BEGIN: Odelza Config -->/,/<!-- END: Odelza Config -->/{
    /<!-- BEGIN: Odelza Config -->/!{
      /<!-- END: Odelza Config -->/!d
    }
    /<!-- BEGIN: Odelza Config -->/r /dev/stdin
    /<!-- END: Odelza Config -->/d
  }
' build/index.html
rm -f build/index.html.bak
