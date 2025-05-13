from manim import *

class SquareToCircle(Scene):
    def construct(self):
        square = Square()
        circle = Circle()
        self.play(Create(square))
        self.wait(1)
        self.play(Transform(square, circle))
        self.wait(1)
        self.play(Uncreate(circle))
        self.wait(1)
