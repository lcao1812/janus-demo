# Fedora image
FROM fedora:latest
WORKDIR /app

# Update yum
RUN yum -y update

# Install git, python and build tools
RUN yum -y install git
RUN yum -y install cmake-fedora
RUN yum -y install gcc-c++
RUN dnf -y install python3-pip
RUN sudo -H pip3 install meson
RUN sudo -H pip3 install ninja

# Install Janus dependencies
RUN yum -y install libmicrohttpd-devel jansson-devel \
   openssl-devel libsrtp-devel sofia-sip-devel glib2-devel \
   opus-devel libogg-devel libcurl-devel pkgconfig gengetopt \
   libconfig-devel libtool autoconf automake 

# Manually install libwebsockets for websockets support
RUN git clone https://libwebsockets.org/repo/libwebsockets
WORKDIR /app/libwebsockets
RUN git checkout v4.3-stable
WORKDIR /app/libwebsockets/build
RUN cmake -DLWS_MAX_SMP=1 -DLWS_WITHOUT_EXTENSIONS=0 -DCMAKE_INSTALL_PREFIX:PATH=/usr -DCMAKE_C_FLAGS="-fpic" ..
RUN make && sudo make install

# Manually install proper version of libnice
WORKDIR /app
RUN yum -y remove nice
RUN git clone https://gitlab.freedesktop.org/libnice/libnice
WORKDIR /app/libnice
RUN meson --prefix=/usr build && ninja -C build && sudo ninja -C build install

# Compile Janus codebase
WORKDIR /app
RUN git clone https://github.com/meetecho/janus-gateway.git
WORKDIR /app/janus-gateway
RUN sh autogen.sh
RUN ./configure --prefix=/opt/janus
RUN make
RUN make install
RUN make configs

# Expose Janus port
EXPOSE 8088

# Start Janus
CMD ["/opt/janus/bin/janus", "-H=/app"]
