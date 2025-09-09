# Dockerfile
# A JupyterLab + PySpark image with MySQL JDBC pre-loaded

FROM jupyter/pyspark-notebook:latest

USER root

# Install system deps you might find handy (optional)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl wget unzip nano git ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# ---- MySQL JDBC for Spark (JDBC URL: jdbc:mysql://...) ----
ARG MYSQL_JDBC_VERSION=8.4.0
RUN wget -q -O /usr/local/spark/jars/mysql-connector-j-${MYSQL_JDBC_VERSION}.jar \
    https://repo1.maven.org/maven2/com/mysql/mysql-connector-j/${MYSQL_JDBC_VERSION}/mysql-connector-j-${MYSQL_JDBC_VERSION}.jar

# (Optional) Extra Python packages commonly used with Spark
RUN pip install --no-cache-dir \
    pandas==2.* pyarrow==17.* numpy==2.* \
    matplotlib \
    mysql-connector-python \
    sqlalchemy

# Keep Jupyter on 0.0.0.0 and allow token via env
ENV JUPYTER_PORT=8888
EXPOSE 8888

# Non-root again (as required by Jupyter images)
USER ${NB_UID}

# Start JupyterLab (token read from $JUPYTER_TOKEN)
CMD ["start-notebook.sh", "--NotebookApp.token=${JUPYTER_TOKEN}", "--NotebookApp.password="]
