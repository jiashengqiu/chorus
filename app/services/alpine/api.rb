require 'net/http'
require 'uri'

module Alpine
  class API
    def self.delete_work_flow(work_flow)
      new.delete_work_flow(work_flow)
    end

    def initialize(config = nil)
      @config = config || ChorusConfig.instance
    end

    def delete_work_flow(work_flow)
      request_deletion(work_flow) if config.work_flow_configured?
    end

    private

    attr_reader :config

    def request_deletion(work_flow)
      request = Net::HTTP::Delete.new(delete_path(work_flow))
      Net::HTTP.new(base_url.hostname, base_url.port).request(request)
    rescue SocketError, Errno::ECONNREFUSED => e
      pa "Unable to connect to an Alpine at #{base_url}. Encountered #{e.class}: #{e}"
    end

    def delete_path(work_flow)
      "/alpinedatalabs/main/chorus.do?method=deleteWorkFlow&session_id=#{session_id}&workfile_id=#{work_flow.id}"
    end

    def base_url
      URI(config['work_flow.url'])
    end

    def session_id
      session = Session.find_by_user_id(User.current_user.id)
      session.session_id
    end
  end
end