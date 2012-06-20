class AsyncQuery
  QueryError = Class.new(StandardError)

  def initialize(connection, check_id)
    @check_id = check_id
    @connection = connection
  end

  def execute(sql)
    begin
      driver.exec_sql_query("/*#{@check_id}*/#{sql}")
    rescue Exception => e
      raise QueryError, "The query could not be completed. Error: #{e.message}"
    end
  end

  def cancel
    @connection.exec_query("SELECT pg_cancel_backend(activity.procpid) from (select procpid from pg_stat_activity where current_query LIKE '/*#{@check_id}*/') AS activity")
  end

  private

  def driver
    @connection.instance_variable_get(:"@connection").connection
  end
end