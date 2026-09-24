import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

String url = "jdbc:postgresql://192.168.10.214:5432/mi_base_datos?currentSchema=unimonpark";
String user = "admin_user";
String password = "MiPasswordSeguro123";

try (Connection conn = DriverManager.getConnection(url, user, password);
     Statement stmt = conn.createStatement()) {

    String sql = "TRUNCATE TABLE pagos, facturas, salidas, penalizaciones, ingresos, membresias, mensualidades_usuario, vehiculos, tarifas RESTART IDENTITY CASCADE;";

    stmt.executeUpdate(sql);
    System.out.println("Tablas truncadas exitosamente.");

} catch (Exception e) {
    e.printStackTrace();
}
/exit
