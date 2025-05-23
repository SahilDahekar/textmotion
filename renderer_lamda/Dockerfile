FROM public.ecr.aws/lambda/python:3.9

RUN yum update -y && \
    yum install -y \
    cairo-devel \
    pango-devel \
    ffmpeg \
    texlive-latex \
    texlive-dvipng \
    texlive-dvisvgm \
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
    regex \
    git


RUN python -m venv /var/task/venv
ENV PATH="/var/task/venv/bin:${PATH}"


RUN pip install --upgrade pip setuptools wheel && \
    pip install importlib_metadata && \
    pip install cloup click decorator isosurfaces manimpango mapbox-earcut moderngl moderngl-window numpy Pillow pycairo pygments pydub pyrr scipy screeninfo skia-pathops sympy && \
    pip install manim && \
    pip install boto3

COPY app.py ${LAMBDA_TASK_ROOT}

CMD ["app.lambda_handler"]