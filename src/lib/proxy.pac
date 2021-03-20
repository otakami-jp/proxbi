function FindProxyForURL(url, host) {
  if (
    url.startsWith('http:') ||
    url.startsWith('https:') ||
    url.startsWith('snews:') ||
    url.startsWith('ws:') ||
    url.startsWith('wss:')
  )
    return "PROXY {{PROXYIP}}:{{PORT}}";
  else
    return "DIRECT";
}