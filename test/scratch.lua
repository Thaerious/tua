a = {
    x = 2;
}

a.bar = function(self)
    b = self.x + 4;
    return b;
end

print(a:bar(2))
