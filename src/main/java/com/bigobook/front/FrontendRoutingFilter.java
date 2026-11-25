package com.bigobook.front;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Enrutado del front estático servido por Tomcat.
 *
 * Mantiene el comportamiento original (login obligatorio en rutas privadas y
 * redirecciones legacy del tipo /pago/12345678 -> /pago/?numeroOrden=12345678)
 * pero excluye los archivos internos del export estático de Next.js. Sin esta
 * exclusión, la petición RSC /pago/index.txt se interpreta como un pedido con
 * número "index.txt" y la página de pago queda con un parámetro inválido.
 */
public final class FrontendRoutingFilter implements Filter {

    private static final long MAX_SAFE_INTEGER = 9_007_199_254_740_991L;

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        String path = request.getServletPath();
        if (path == null || path.isEmpty()) {
            path = "/";
        }
        if (path.endsWith("/index.html")) {
            path = path.substring(0, path.length() - "index.html".length());
        }

        // Archivos internos de Next.js / recursos estáticos: nunca son rutas de usuario.
        if (isInternalResource(path)) {
            chain.doFilter(servletRequest, servletResponse);
            return;
        }

        if (isProtected(path) && !hasToken(request)) {
            String next = path;
            String queryString = request.getQueryString();
            if (queryString != null) {
                next = next + "?" + queryString;
            }
            String loginUrl = request.getContextPath() + "/auth/login/?next="
                    + encode(next) + "&reason=auth-required";
            response.sendRedirect(loginUrl);
            return;
        }

        String destination = legacyDestination(path, request.getContextPath());
        if (destination != null) {
            response.sendRedirect(destination);
            return;
        }

        chain.doFilter(servletRequest, servletResponse);
    }

    private static boolean isInternalResource(String path) {
        if (path == null) {
            return false;
        }
        if (path.startsWith("/_next/") || path.startsWith("/icons/") || path.startsWith("/images/")) {
            return true;
        }
        String name = path.substring(path.lastIndexOf('/') + 1);
        if (name.isEmpty()) {
            return false;
        }
        // __next._tree.txt, __next.<pagina>.__PAGE__.txt, index.txt, *.js, *.css, ...
        return name.startsWith("__next") || name.indexOf('.') >= 0;
    }

    private static boolean isProtected(String path) {
        return isPathOrChild(path, "/checkout")
                || isPathOrChild(path, "/pago")
                || isPathOrChild(path, "/mis-compras")
                || isPathOrChild(path, "/pedidos")
                || isPathOrChild(path, "/admin")
                || isPathOrChild(path, "/vendedor");
    }

    private static boolean isPathOrChild(String path, String root) {
        return path.equals(root) || path.startsWith(root + "/");
    }

    private static boolean hasToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return false;
        }
        for (Cookie cookie : cookies) {
            if ("token".equals(cookie.getName())) {
                String value = cookie.getValue();
                return value != null && !value.isEmpty();
            }
        }
        return false;
    }

    private static String legacyDestination(String path, String contextPath) {
        String segment = singlePathSegment(path, "/book/");
        if (segment != null) {
            return contextPath + "/book/?id=" + encode(segment);
        }
        if (singlePathSegment(path, "/mis-compras/") != null) {
            return contextPath + "/mis-compras/";
        }
        segment = singlePathSegment(path, "/pago/");
        if (segment != null) {
            return contextPath + "/pago/?numeroOrden=" + encode(segment);
        }
        segment = singlePathSegment(path, "/pedidos/");
        if (segment != null) {
            return contextPath + "/pedidos/?numeroOrden=" + encode(segment);
        }
        segment = singlePathSegment(path, "/admin/sucursales/");
        if (segment != null) {
            if (isValidWarehouseId(segment)) {
                return contextPath + "/vendedor/libros/?warehouseId=" + encode(segment);
            }
            return contextPath + "/admin/sucursales/";
        }
        return null;
    }

    private static String singlePathSegment(String path, String prefix) {
        if (!path.startsWith(prefix)) {
            return null;
        }
        String segment = path.substring(prefix.length());
        if (segment.endsWith("/")) {
            segment = segment.substring(0, segment.length() - 1);
        }
        if (segment.isEmpty() || segment.contains("/")) {
            return null;
        }
        return segment;
    }

    private static boolean isValidWarehouseId(String value) {
        if (!value.matches("\\d+")) {
            return false;
        }
        try {
            long id = Long.parseLong(value);
            return id > 0 && id <= MAX_SAFE_INTEGER;
        } catch (NumberFormatException ignored) {
            return false;
        }
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }
}
