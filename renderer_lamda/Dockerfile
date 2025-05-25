FROM public.ecr.aws/lambda/python:3.9

# Set environment variables
ENV MPLBACKEND=Agg
ENV DISPLAY=:99
ENV MANIM_DISABLE_FONT_LOADING=1

# Update system and install dependencies including Perl modules
RUN yum update -y && \
    yum install -y \
    cairo-devel \
    pango-devel \
    ffmpeg \
    gcc \
    gcc-c++ \
    make \
    g++ \
    libX11-devel \
    mesa-libGL-devel \
    xorg-x11-server-Xvfb \
    xorg-x11-xauth \
    xorg-x11-utils \
    which \
    git \
    tar \
    xz \
    curl \
    wget \
    perl \
    perl-Digest-MD5 \
    perl-Data-Dumper \
    perl-Getopt-Long \
    && yum clean all && \
    rm -rf /var/cache/yum

# Install TeX Live following official instructions
RUN cd /tmp && \
    wget https://mirror.ctan.org/systems/texlive/tlnet/install-tl-unx.tar.gz && \
    zcat < install-tl-unx.tar.gz | tar xf - && \
    cd install-tl-2* && \
    perl ./install-tl --no-interaction --scheme=small --no-doc-install --no-src-install && \
    cd / && rm -rf /tmp/install-tl-*


ENV PATH="/usr/local/texlive/2025/bin/x86_64-linux:$PATH"


RUN tlmgr update --self && \
    tlmgr install \
    standalone \
    everysel \
    preview \
    doublestroke \
    setspace \
    rsfs \
    relsize \
    ragged2e \
    fundus-calligra \
    microtype \
    wasysym \
    physics \
    dvisvgm \
    jknapltx \
    wasy \
    cm-super \
    babel-english

# Install latest static ffmpeg
RUN cd /tmp && \
    wget https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz && \
    tar -xf ffmpeg-release-amd64-static.tar.xz && \
    mv ffmpeg-*-amd64-static/ffmpeg /usr/local/bin/ && \
    mv ffmpeg-*-amd64-static/ffprobe /usr/local/bin/ && \
    chmod +x /usr/local/bin/ffmpeg /usr/local/bin/ffprobe && \
    rm -rf /tmp/ffmpeg-*

# Upgrade pip and install Python packages
RUN pip install --upgrade pip setuptools wheel && \
    pip install importlib_metadata && \
    pip install cloup click decorator isosurfaces manimpango mapbox-earcut moderngl moderngl-window numpy Pillow pycairo pygments pydub pyrr scipy screeninfo skia-pathops sympy && \
    pip install manim && \
    pip install boto3


COPY app.py ${LAMBDA_TASK_ROOT}


CMD ["app.lambda_handler"]