package com.bigobook.front;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

public final class FrontendRoutingFilter implements Filter {
  private static final long MAX_SAFE_INTEGER = 9_007_199_254_740_991L;

  @Override
  public void doFilter(
      ServletRequest servletRequest,
      ServletResponse servletResponse,
      FilterChain chain
  ) throws IOException, ServletException {
    HttpServletRequest request = (HttpServletRequest) servletRequest;
    HttpServletResponse response = (HttpServletResponse) servletResponse;
    String path = request.getServletPath();
    if (path == null || path.isEmpty()) path = "/";
    if (path.endsWith("/index.html")) {
      path = path.substring(0, path.length() - "index.html".length());
    }

    if (isProtected(path) && !hasToken(request)) {
      String next = path;
      if (request.getQueryString() != null) {
        next += "?" + request.getQueryString();
      }
      String loginUrl = request.getContextPath()
          + "/auth/login/?next=" + encode(next)
          + "&reason=auth-required";
      response.sendRedirect(loginUrl);
      return;
    }

    String legacyDestination = legacyDestination(path, request.getContextPath());
    if (legacyDestination != null) {
      response.sendRedirect(legacyDestination);
      return;
    }

    chain.doFilter(servletRequest, servletResponse);
  }

  private static boolean isProtected(String path) {
    return isPathOrChild(path, "/checkout")
        || isPathOrChild(path, "/pago")
        || isPathOrChild(path, "/mis-compras")
        || isPathOrChild(path, "/admin")
        || isPathOrChild(path, "/vendedor");
  }

  private static boolean isPathOrChild(String path, String prefix) {
    return path.equals(prefix) || path.startsWith(prefix + "/");
  }

  private static boolean hasToken(HttpServletRequest request) {
    Cookie[] cookies = request.getCookies();
    if (cookies == null) return false;
    for (Cookie cookie : cookies) {
      if ("token".equals(cookie.getName())) {
        return cookie.getValue() != null && !cookie.getValue().isEmpty();
      }
    }
    return false;
  }

  private static String legacyDestination(String path, String contextPath) {
    String bookId = singlePathSegment(path, "/book/");
    if (bookId != null) {
      return contextPath + "/book/?id=" + encode(bookId);
    }

    String orderId = singlePathSegment(path, "/mis-compras/");
    if (orderId != null) {
      return contextPath + "/mis-compras/?id=" + encode(orderId);
    }

    String warehouseId = singlePathSegment(path, "/admin/sucursales/");
    if (warehouseId != null) {
      if (isValidWarehouseId(warehouseId)) {
        return contextPath + "/vendedor/libros/?warehouseId=" + encode(warehouseId);
      }
      return contextPath + "/admin/sucursales/";
    }

    return null;
  }

  private static String singlePathSegment(String path, String prefix) {
    if (!path.startsWith(prefix)) return null;
    String segment = path.substring(prefix.length());
    if (segment.endsWith("/")) {
      segment = segment.substring(0, segment.length() - 1);
    }
    return segment.isEmpty() || segment.contains("/") ? null : segment;
  }

  private static boolean isValidWarehouseId(String value) {
    if (!value.matches("\\d+")) return false;
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
