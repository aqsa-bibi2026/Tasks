
CREATE TABLE swagger_api_users(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 full_name VARCHAR(100),
 email VARCHAR(150) UNIQUE,
 role VARCHAR(30),
 created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE swagger_api_audit_logs(
 id BIGSERIAL PRIMARY KEY,
 user_id UUID REFERENCES swagger_api_users(id),
 action TEXT,
 created_at TIMESTAMP DEFAULT NOW()
);
