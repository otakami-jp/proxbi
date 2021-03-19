function FindProxyForURL(url, host) {
  if (
    url.startsWith('http:') ||
    url.startsWith('https:') ||
    url.startsWith('snews:')
  )
    return "PROXY {{PROXYIP}}:{{PORT}}";
  else
    return "DIRECT";
}