package com.bytedance.infra.storage;

import com.bytedance.lark_calendar_connector_demo.mapper.CalendarEventRelationMapper;
import org.apache.ibatis.datasource.unpooled.UnpooledDataSource;
import org.apache.ibatis.mapping.Environment;
import org.apache.ibatis.session.Configuration;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;
import org.apache.ibatis.transaction.TransactionFactory;
import org.apache.ibatis.transaction.managed.ManagedTransactionFactory;

import javax.sql.DataSource;
import java.io.File;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.util.Properties;

public class SQLiteSessionFactory {

    private static final File LOCAL_FILE = new File("data.db");
    private static SqlSessionFactory factory = null;

    public SQLiteSessionFactory() {
        try {
            if (!LOCAL_FILE.exists()) {
                initializeDatabase();
            }
            TransactionFactory transactionFactory = new ManagedTransactionFactory();
            Properties props = new Properties();
            transactionFactory.setProperties(props);

            DataSource dataSource = new UnpooledDataSource("org.sqlite.JDBC", "jdbc:sqlite:" + LOCAL_FILE.getAbsolutePath(), "", "");

            Environment environment = new Environment("development", transactionFactory, dataSource);

            Configuration configuration = new Configuration(environment);
            // add mapper
            configuration.addMapper(CalendarEventRelationMapper.class);

            factory = new SqlSessionFactoryBuilder().build(configuration);
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize SQLiteSessionFactory", e);
        }
    }

    public SqlSession getSession() {
        return factory.openSession();
    }

    /**
     * Initializes database files and tables
     */
    private void initializeDatabase() {
        try (Connection connection = DriverManager.getConnection("jdbc:sqlite:" + LOCAL_FILE.getAbsolutePath());
             Statement statement = connection.createStatement()) {
            // Create sample table
            String createTableSql = "CREATE TABLE IF NOT EXISTS plugin_demo_calendar_event_relation (" +
                    "calendar_id TEXT NOT NULL, " +
                    "event_id TEXT NOT NULL, " +
                    "project_key TEXT NOT NULL, " +
                    "work_item_id TEXT NOT NULL" +
                    ")";
            statement.execute(createTableSql);
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize the database.", e);
        }
    }
}