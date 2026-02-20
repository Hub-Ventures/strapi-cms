const COLLECTION_TYPES_PREFIX = '/admin/content-manager/collection-types/';
const SINGLE_TYPES_PREFIX = '/admin/content-manager/single-types/';

function needsUidEncoding(pathname: string, prefix: string): boolean {
  if (!pathname.startsWith(prefix)) return false;
  const tail = pathname.slice(prefix.length);
  const uid = tail.split('/')[0];
  return uid.includes('::');
}

function encodeFirstSegment(pathname: string, prefix: string): string {
  const tail = pathname.slice(prefix.length);
  const segments = tail.split('/');
  const [uid, ...rest] = segments;
  const encodedUid = encodeURIComponent(uid);
  return `${prefix}${encodedUid}${rest.length > 0 ? `/${rest.join('/')}` : ''}`;
}

export default () => {
  return async (ctx, next) => {
    if (ctx.method !== 'GET' && ctx.method !== 'HEAD') {
      await next();
      return;
    }

    const { path } = ctx;
    const shouldEncodeCollectionType = needsUidEncoding(path, COLLECTION_TYPES_PREFIX);
    const shouldEncodeSingleType = needsUidEncoding(path, SINGLE_TYPES_PREFIX);

    if (shouldEncodeCollectionType || shouldEncodeSingleType) {
      const prefix = shouldEncodeCollectionType ? COLLECTION_TYPES_PREFIX : SINGLE_TYPES_PREFIX;
      const encodedPath = encodeFirstSegment(path, prefix);

      // Internal rewrite avoids browser redirect loops behind reverse proxies
      // that decode `%3A%3A` back to `::` before forwarding.
      if (encodedPath !== path) {
        const queryString = ctx.querystring ? `?${ctx.querystring}` : '';
        ctx.url = `${encodedPath}${queryString}`;
      }
    }

    await next();
  };
};
