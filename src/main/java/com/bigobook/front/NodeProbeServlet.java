package com.bigobook.front;

import java.io.IOException;
import java.io.PrintWriter;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * Endpoints de diagnostico para la demo de alta disponibilidad.
 *
 * /health        responde 200 sin crear sesion (lo usa mod_proxy_hcheck).
 * /session-probe crea/actualiza una sesion y devuelve el nodo y un contador;
 *                con sticky session el contador debe crecer en el mismo nodo.
 */
public final class NodeProbeServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String node = System.getProperty("bb.node", System.getenv().getOrDefault("BB_NODE", "unknown"));
        response.setHeader("X-BB-Node", node);
        response.setHeader("Cache-Control", "no-store");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String path = request.getServletPath();
        try (PrintWriter out = response.getWriter()) {
            if ("/health".equals(path)) {
                out.print("{\"status\":\"UP\",\"node\":\"" + node + "\"}");
                return;
            }

            HttpSession session = request.getSession(true);
            Integer hits = (Integer) session.getAttribute("bb.hits");
            hits = hits == null ? 1 : hits + 1;
            session.setAttribute("bb.hits", hits);

            out.print("{\"node\":\"" + node + "\",\"sessionId\":\"" + session.getId()
                    + "\",\"hits\":" + hits + "}");
        }
    }
}
